import _ from 'lodash';
import {default as AWSNISTMappings} from '../../data/aws-config-mapping.json';

export class AwsConfigMapping {
  awsConfigRuleNameMappings: Record<string, string[]> = {};
  awsConfigRuleSourceIdentifierMappings: Record<string, string[]> = {};

  constructor() {
    AWSNISTMappings.forEach((mapping) => {
      this.awsConfigRuleNameMappings[mapping.AwsConfigRuleName] =
        mapping['NIST-ID'].split('|');
      this.awsConfigRuleSourceIdentifierMappings[
        mapping.AwsConfigRuleSourceIdentifier
      ] = mapping['NIST-ID'].split('|');
    });
  }

  searchNIST(identifiers: string[]): string[] {
    if (identifiers.length === 0) {
      return [];
    } else {
      let matches: string[] = [];
      Object.entries(this.awsConfigRuleNameMappings).forEach(
        ([awsConfigRuleName, NISTTags]) => {
          identifiers.forEach((identifier) => {
            if (
              identifier.toLowerCase().toLowerCase().includes(awsConfigRuleName)
            ) {
              matches = matches.concat(NISTTags);
            }
          });
        }
      );

      Object.entries(this.awsConfigRuleSourceIdentifierMappings).forEach(
        ([awsConfigRuleSourceIdentifier, NISTTags]) => {
          identifiers.forEach((identifier) => {
            if (
              identifier
                .toLowerCase()
                .includes(awsConfigRuleSourceIdentifier.toLowerCase())
            ) {
              matches = matches.concat(NISTTags);
            }
          });
        }
      );
      return _.uniq(matches);
    }
  }
}
