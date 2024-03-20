var _a;
import { ApiItemKind, ApiModel, ApiNamespace, } from "@microsoft/api-extractor-model";
import { DocExcerpt, DocNodeKind, } from "@microsoft/tsdoc";
import fs from "fs";
import colors from "colors";
if (process.argv.length < 3) {
    console.error("Usage: node index.js <path to studio.api.json> <output json path>");
    process.exit(1);
}
const apiPath = process.argv[2];
const outputJsonPath = process.argv[3];
// https://github.com/microsoft/tsdoc/blob/main/api-demo/src/Formatter.ts#L7-L18
const renderDocNode = (docNode) => {
    let result = "";
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
const parseDocComment = (docComment) => {
    let parsedComment = {
        summary: "",
        exampleTags: [],
    };
    for (let child of docComment.getChildNodes()) {
        if (child.kind === DocNodeKind.Section) {
            parsedComment.summary = renderDocNode(child);
        }
        else if (child.kind === DocNodeKind.Block) {
            let sectionChild = child.getChildNodes()[1];
            const tagContent = renderDocNode(sectionChild);
            parsedComment.exampleTags.push(tagContent);
        }
    }
    return parsedComment;
};
const dumpTSDocTree = (docNode, indent) => {
    let dumpText = "";
    if (docNode instanceof DocExcerpt) {
        const content = docNode.content.toString();
        dumpText +=
            colors.gray(`${indent}* ${docNode.excerptKind}=`) +
                colors.cyan(JSON.stringify(content));
    }
    else {
        dumpText += `${indent}- ${docNode.kind}`;
    }
    console.log(dumpText);
    for (const child of docNode.getChildNodes()) {
        dumpTSDocTree(child, indent + "  ");
    }
};
const apiModel = new ApiModel();
const apiPackage = apiModel.loadPackage(apiPath);
const apiEntryPoints = apiPackage.entryPoints;
if (apiEntryPoints.length !== 1) {
    throw new Error("Expecting exactly one entry point");
}
const apiEntryPoint = apiEntryPoints[0];
const apiJson = {
    modules: {},
    extendsMap: {},
};
for (const module of apiEntryPoint.members) {
    const moduleName = module.displayName.replace("_2", "");
    if (!(module instanceof ApiNamespace))
        continue;
    if (!["Geometry", "Animation"].includes(moduleName)) {
        console.log("Skipping", moduleName);
        continue;
    }
    const moduleJson = {};
    for (const studioClass of module.members) {
        if (studioClass.kind !== ApiItemKind.Class) {
            console.log("Skipping", studioClass.displayName);
        }
        const classJson = {};
        apiJson.extendsMap[studioClass.displayName] =
            ((_a = studioClass.extendsType) === null || _a === void 0 ? void 0 : _a.excerpt.text) || "";
        const docComment = studioClass.tsdocComment;
        let parsedDocComment;
        if (docComment !== undefined) {
            // dumpTSDocTree(docComment, "");
            parsedDocComment = parseDocComment(docComment);
            classJson.summary = parsedDocComment.summary;
            classJson.examples = parsedDocComment.exampleTags;
        }
        const classConstructor = studioClass.members.find((apiItem) => apiItem.kind === ApiItemKind.Constructor);
        classJson.signature =
            classConstructor !== undefined
                ? classConstructor
                    .getExcerptWithModifiers()
                    .replace(/[\r\n]+/g, "")
                    .replace(/[\s]+/g, " ")
                : "";
        classJson.attributes = [];
        for (const parameter of classConstructor
            .parameters) {
            classJson.attributes.push({
                name: parameter.name,
                type: parameter.parameterTypeExcerpt.spannedTokens
                    .map((token) => token.text.replace(/[\r\n]+/g, "").replace(/[\s]+/g, " "))
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
