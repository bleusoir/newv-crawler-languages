// noinspection JSUnusedGlobalSymbols
class VersionInfo implements IVersionInfo {
  id: number = 0;
  icon: string = '';
  name: string = '';
  version_num: number = 0;
  version_text: string = '';
  is_ga: boolean = false;
  feature_count: number = 0;
  fixed_issue_count: number = 0;
  update_date_text: any = null;
  created: any = null;
  updated: any = null;
}

export interface IVersionInfo {
  id: number;
  icon: string;
  name: string;
  version_num: number;
  version_text: string;
  is_ga: boolean;
  feature_count: number;
  fixed_issue_count: number;
  update_date_text: any;
  created: any;
  updated: any;
}

export { VersionInfo };