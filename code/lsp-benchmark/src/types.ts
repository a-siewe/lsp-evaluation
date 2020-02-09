export interface ClientOptions {
    rootDir?: string
    outDir?: string
}

export interface  Measurement{
    file: string;
    fileStat: any;
    duration?: number;
    executionDuration: ExecutionDuration
}


export interface ExecutionDuration {
    startTime: number;
    endTime?: number;
}
