import { ApiModel, ApiPackage } from '@microsoft/api-extractor-model';

const apiModel: ApiModel = new ApiModel();
const apiPackage: ApiPackage = apiModel.loadPackage('./temp/studio.api.json');

// console.dir(apiPackage);
console.log(apiPackage.name);
const entryPoint = apiPackage.entryPoints[0];
console.log(entryPoint.kind);

type MemberKindShown = {
	[key: string]: boolean;
};
let shown: MemberKindShown = {};
for (const member of entryPoint.members) {
	console.log(member.displayName);
	for (const member2 of member.members) {
		console.log("\t", member2.getScopedNameWithinPackage(), member2.kind, member2.members.length);
		switch (member2.kind) {
			case 'Class':
				for (const classMember of member2.members) {
					console.log("\t\t", classMember.getScopedNameWithinPackage(), classMember.kind, classMember.members.length);
					displaySerializedInfo(classMember);
				}
				break;
			case 'Variable':
				break;
			
			case 'Interface':
				for (const interfaceMember of member2.members) {
					console.log(
						'\t\t',
						interfaceMember.displayName,
						interfaceMember.kind,
						interfaceMember.members.length
					);
					displaySerializedInfo(interfaceMember);
				}
				break;
			case 'TypeAlias':
				break;
		}
	}
}

function displaySerializedInfo(member: any) {
	// to display hierarchy only uncomment the next line
	//return;
	if (shown[member.kind]) {
		return;
	}
	shown[member.kind] = true;
	let foo = {}
	member.serializeInto(foo);
	console.log(`Deserialized ${member.kind}`, foo);
}