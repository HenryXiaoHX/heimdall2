/**
 * Tracks uploaded files, and their parsed contents
 */

import {
  EvaluationFile,
  FileID,
  ProfileFile,
  SourcedContextualizedEvaluation,
  SourcedContextualizedProfile
} from '@/store/report_intake';
import Store from '@/store/store';
import {ChecklistFile} from '@mitre/hdf-converters';
import _ from 'lodash';
import {
  Action,
  getModule,
  Module,
  Mutation,
  VuexModule
} from 'vuex-module-decorators';
import {FilteredDataModule} from './data_filters';

/** We make some new variant types of the Contextual types, to include their files*/
export function isFromProfileFile(p: SourcedContextualizedProfile) {
  return p.sourcedFrom === null;
}

@Module({
  namespaced: true,
  dynamic: true,
  store: Store,
  name: 'data'
})
export class InspecData extends VuexModule {
  /** State var containing all execution files that have been added */
  executionFiles: EvaluationFile[] = [];

  /** State var containing all profile files that have been added */
  profileFiles: ProfileFile[] = [];

  /** State var containing all checklist files that have been added */
  checklistFiles: ChecklistFile[] = [];

  /** Return all of the files that we currently have. */
  get allFiles(): (EvaluationFile | ProfileFile)[] {
    const result: (EvaluationFile | ProfileFile)[] = [];
    result.push(...this.executionFiles);
    result.push(...this.profileFiles);
    return result;
  }

  /* Return all evaluation files only */
  get allEvaluationFiles(): EvaluationFile[] {
    return this.executionFiles;
  }

  /* Return all profile files only */
  get allProfileFiles(): ProfileFile[] {
    return this.profileFiles;
  }

  /** Return all checklist files only */
  get allChecklistFiles(): ChecklistFile[] {
    return this.checklistFiles;
  }

  /**
   * Returns a readonly list of all executions currently held in the data store
   * including associated context
   */
  get contextualExecutions(): readonly SourcedContextualizedEvaluation[] {
    return this.executionFiles.map((file) => file.evaluation);
  }

  get loadedDatabaseIds(): string[] {
    const ids: string[] = [];
    this.allFiles.forEach((file) => {
      if (file.database_id) {
        ids.push(file.database_id.toString());
      }
    });
    return ids;
  }

  /**
   * Returns a readonly list of all profiles belonging to executions currently
   * held in the data store
   */
  get contextualExecutionProfiles(): readonly SourcedContextualizedProfile[] {
    return this.contextualExecutions.flatMap(
      (evaluation) => evaluation.contains
    ) as SourcedContextualizedProfile[];
  }

  /**
   * Returns a readonly list of all profiles currently held in the data store
   * including associated context
   */
  get contextualProfiles(): readonly SourcedContextualizedProfile[] {
    return this.profileFiles.map((file) => file.profile);
  }

  get allProfiles(): readonly SourcedContextualizedProfile[] {
    return this.contextualProfiles.concat(this.contextualExecutionProfiles);
  }

  /**
   * Adds a profile file to the store.
   * @param newProfile The profile to add
   */
  @Mutation
  addProfile(newProfile: ProfileFile) {
    this.profileFiles.push(newProfile);
  }

  /**
   * Adds an execution file to the store.
   * @param newExecution The execution to add
   */
  @Mutation
  addExecution(newExecution: EvaluationFile) {
    this.executionFiles.push(newExecution);
  }

  /**
   * Adds a checklist file to the store.
   * @param newChecklist The checklist to add
   */
  @Mutation
  addChecklist(newChecklist: ChecklistFile) {
    this.checklistFiles.push(newChecklist);
  }

  /**
   * Unloads the file with the given id
   */
  @Action
  removeFile(fileId: FileID) {
    FilteredDataModule.clear_file(fileId);
    this.context.commit('REMOVE_PROFILE', fileId);
    this.context.commit('REMOVE_RESULT', fileId);
    this.context.commit('REMOVE_CHECKLIST', fileId);
  }

  @Mutation
  REMOVE_PROFILE(fileId: FileID) {
    this.profileFiles = this.profileFiles.filter(
      (pf) => pf.uniqueId !== fileId
    );
  }

  @Mutation
  REMOVE_RESULT(fileId: FileID) {
    this.executionFiles = this.executionFiles.filter(
      (ef) => ef.uniqueId !== fileId
    );
  }

  @Mutation
  REMOVE_CHECKLIST(fileId: FileID) {
    this.checklistFiles = this.checklistFiles.filter(
      (cf) => cf.uniqueId !== fileId
    );
  }

  @Mutation
  UPDATE_CHECKLISTS() {
    this.checklistFiles.forEach((checklistFile) => {
      // Setting assets
      _.set(checklistFile.raw, 'value.asset.role', checklistFile.asset.role);
      _.set(
        checklistFile.raw,
        'value.asset.assettype',
        checklistFile.asset.assettype
      );
      _.set(
        checklistFile.raw,
        'value.asset.marking',
        checklistFile.asset.marking
      );
      _.set(
        checklistFile.raw,
        'value.asset.hostname',
        checklistFile.asset.hostname
      );
      _.set(
        checklistFile.raw,
        'value.asset.hostip',
        checklistFile.asset.hostip
      );
      _.set(
        checklistFile.raw,
        'value.asset.hostmac',
        checklistFile.asset.hostmac
      );
      _.set(
        checklistFile.raw,
        'value.asset.hostfqdn',
        checklistFile.asset.hostfqdn
      );
      _.set(
        checklistFile.raw,
        'value.asset.targetcomment',
        checklistFile.asset.targetcomment
      );
      _.set(
        checklistFile.raw,
        'value.asset.techarea',
        checklistFile.asset.techarea
      );
      _.set(
        checklistFile.raw,
        'value.asset.webordatabase',
        checklistFile.asset.webordatabase
      );
      _.set(
        checklistFile.raw,
        'value.asset.webdbsite',
        checklistFile.asset.webdbsite
      );
      _.set(
        checklistFile.raw,
        'value.asset.webdbinstance',
        checklistFile.asset.webdbinstance
      );

      // Setting STIGs
      // _.set(checklistFile.raw, '')
    });
  }

  /**
   * Clear all stored data.
   */
  @Mutation
  reset() {
    this.profileFiles = [];
    this.executionFiles = [];
    this.checklistFiles = [];
  }
}

export const InspecDataModule = getModule(InspecData);
