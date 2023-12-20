import { ApiModel, ApiPackage } from '@microsoft/api-extractor-model';

const apiModel: ApiModel = new ApiModel();
const apiPackage: ApiPackage = apiModel.loadPackage('./temp/studio.api.json');

// console.dir(apiPackage);
console.log(apiPackage.name);
// console.log(apiPackage.entryPoints);
console.log(apiPackage.entryPoints[0].members);
// for (const member of apiPackage.members) {
// 	console.log(member.displayName);
// }
