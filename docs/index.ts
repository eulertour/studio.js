import { ApiModel, ApiPackage } from '@microsoft/api-extractor-model';

const apiModel: ApiModel = new ApiModel();
const apiPackage: ApiPackage = apiModel.loadPackage('api/studio.api.json');
const apiEntryPoints = apiPackage.entryPoints;
if (apiEntryPoints.length !== 1) {
  throw new Error('Expecting exactly one entry point');
}
const apiEntryPoint = apiEntryPoints[0];

for (const member of apiEntryPoint.members) {
  console.log(member.displayName);
}

console.log(
  (apiEntryPoint.members[4].members[9] as any).tsdocComment.summarySection.nodes[0].nodes[0].text
)