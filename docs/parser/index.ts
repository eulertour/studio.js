import {
  ApiDeclaredItem,
  ApiItemKind,
  ApiModel,
  ApiPackage,
  ApiNamespace,
  ApiClass,
  ApiParameterListMixin,
  ApiDocumentedItem,
} from "@microsoft/api-extractor-model";
import {
  DocNode,
  DocExcerpt,
  DocNodeKind,
  DocSection,
  DocComment,
} from "@microsoft/tsdoc";
import fs from "fs";
import colors from "colors";
import * as Studio from "../../build/bundle.js";

if (process.argv.length < 3) {
  console.error(
    "Usage: node index.js <path to studio.api.json> <output json path>",
  );
  process.exit(1);
}
const apiPath = process.argv[2];
const outputJsonPath = process.argv[3];

// https://github.com/microsoft/tsdoc/blob/main/api-demo/src/Formatter.ts#L7-L18
const renderDocNode = (docNode: DocNode): string => {
  let result: string = "";
  if (docNode) {
    if (docNode instanceof DocExcerpt) {
      result += docNode.content.toString();
    }
    for (const childNode of docNode.getChildNodes()) {
      result += renderDocNode(childNode);
    }
  }
  return result.trim();
};

const parseDocComment = (docComment: DocComment) => {
  type ParsedComment = {
    summary: string;
    exampleTags: Array<string>;
  };

  let parsedComment: ParsedComment = {
    summary: "",
    exampleTags: [],
  };

  for (let child of docComment.getChildNodes()) {
    if (child.kind === DocNodeKind.Section) {
      parsedComment.summary = renderDocNode(child);
    } else if (child.kind === DocNodeKind.Block) {
      let sectionChild = child.getChildNodes()[1] as DocSection;
      const tagContent = renderDocNode(sectionChild);
      parsedComment.exampleTags.push(tagContent);
    }
  }

  return parsedComment;
};

const dumpTSDocTree = (docNode: DocNode, indent: string): void => {
  let dumpText: string = "";
  if (docNode instanceof DocExcerpt) {
    const content: string = docNode.content.toString();
    dumpText +=
      colors.gray(`${indent}* ${docNode.excerptKind}=`) +
      colors.cyan(JSON.stringify(content));
  } else {
    dumpText += `${indent}- ${docNode.kind}`;
  }

  for (const child of docNode.getChildNodes()) {
    dumpTSDocTree(child, indent + "  ");
  }
};

const apiModel: ApiModel = new ApiModel();
const apiPackage: ApiPackage = apiModel.loadPackage(apiPath);
const apiEntryPoints = apiPackage.entryPoints;
if (apiEntryPoints.length !== 1) {
  throw new Error("Expecting exactly one entry point");
}
const apiEntryPoint = apiEntryPoints[0];

type StudioApiJson = {
  modules: { [key: string]: any };
  extendsMap: { [key: string]: string };
};

const apiJson: StudioApiJson = {
  modules: {},
  extendsMap: {},
};

for (const module of apiEntryPoint.members) {
  const moduleName = module.displayName.replace("_2", "");

  if (!(module instanceof ApiNamespace)) continue;
  if (moduleName === "Utils") {
    console.log("Skipping", moduleName);
    continue;
  }

  const moduleJson: any = {};
  for (const studioClass of module.members) {
    if (studioClass.kind !== ApiItemKind.Class) {
      console.log("Skipping", studioClass.displayName);
      continue;
    }

    const classJson: any = {};
    apiJson.extendsMap[studioClass.displayName] =
      (studioClass as ApiClass).extendsType?.excerpt.text || "";
    const docComment = (studioClass as ApiDocumentedItem).tsdocComment;

    const curClass = (Studio as any)[moduleName][studioClass.displayName];
    if (curClass.defaultConfig) {
      classJson.defaultConfig = JSON.stringify(curClass.defaultConfig());
    }

    let parsedDocComment;
    if (docComment !== undefined) {
      // dumpTSDocTree(docComment, "");
      parsedDocComment = parseDocComment(docComment);
      classJson.summary = parsedDocComment.summary;
      classJson.examples = parsedDocComment.exampleTags;
    }

    const classConstructor = studioClass.members.find(
      (apiItem) => apiItem.kind === ApiItemKind.Constructor,
    );
    classJson.signature =
      classConstructor !== undefined
        ? (classConstructor as ApiDeclaredItem)
            .getExcerptWithModifiers()
            .replace(/[\r\n]+/g, "")
            .replace(/[\s]+/g, " ")
        : "";

    classJson.attributes = [];
    for (const parameter of (classConstructor as ApiParameterListMixin)
      .parameters) {
      classJson.attributes.push({
        name: parameter.name,
        type: parameter.parameterTypeExcerpt.spannedTokens
          .map((token) =>
            token.text.replace(/[\r\n]+/g, "").replace(/[\s]+/g, " "),
          )
          .join(""),
      });
    }
    // console.dir(classJson, { depth: null });
    moduleJson[studioClass.displayName] = classJson;
  }
  apiJson.modules[moduleName] = moduleJson;
}

// console.log(JSON.stringify(apiJson, null, 4));
fs.writeFileSync(outputJsonPath, JSON.stringify(apiJson));
