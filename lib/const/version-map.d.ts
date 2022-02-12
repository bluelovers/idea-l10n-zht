declare namespace version_map {
    type IVersionApiResultRow = {
        id: string;
        link: string;
        version: string;

        approve: boolean;
        listed: boolean;
        recalculateCompatibilityAllowed: boolean;
        cdate: string;
        file: string;
        notes: string;
        since: string;
        until: string;
        sinceUntil: string;
        channel: string;
        size: number;
        downloads: number;
        pluginId: number;
        compatibleVersions: {
            GOLAND: string;
            PHPSTORM: string;
            DATASPELL: string;
            WEBSTORM: string;
            GATEWAY: string;
            IDEA_COMMUNITY: string;
            CLION: string;
            IDEA: string;
            PYCHARM_EDUCATIONAL: string;
            PYCHARM_COMMUNITY: string;
            PYCHARM: string;
            DBE: string;
            CWMGUEST: string;
            RUBYMINE: string;
            APPCODE: string;
            IDEA_EDUCATIONAL: string;
            JBCLIENT: string;
        };
        author: {
            id: string;
            name: string;
            link: string;
            hubLogin: string;
            isJetBrains: boolean;
            icon: string;
        };
        modules: any[];
    }
    type IVersionApiResult = IVersionApiResultRow[];
    type IVersionDownloadMap = Record<string, string>;
    type IVersionMapRecord = Record<string, IVersionApiResultRow>;
    interface IVersionMap {
        version_map_record: IVersionMapRecord;
        series: string[];
        version_download_map: IVersionDownloadMap;
        series_latest_map: IVersionDownloadMap;
    }
    const version_map_record: IVersionMap["version_map_record"];
    const series: IVersionMap["series"];
    const version_download_map: IVersionMap["version_download_map"];
    const series_latest_map: IVersionMap["series_latest_map"];
}
export = version_map;
