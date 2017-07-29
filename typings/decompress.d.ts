declare module "decompress" {
    function Decompress(input: string | Buffer, outputDirectory: string): Promise<File[]>;
    function Decompress(input: string | Buffer, outputDirectory: string, options: Options): Promise<File[]>;

    interface Options {
        filter?: (file: File) => boolean;
        map?: (file: File) => File;
        /**
         * Remove leading directory components from extracted files.
         */
        strip?: number;
        plugins?: any[];
    }

    export = Decompress;
} 