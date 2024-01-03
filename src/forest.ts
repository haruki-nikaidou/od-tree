import {OnedriveAccount} from "./types/odTree";
import OdTree from "./index";
import {back, cd, Directory, fromOdTree, mkdir} from "./fileSystem";

export class OnedriveTreeFs {
    root?: Directory;
    ready: Promise<void> = new Promise(() => {});

    constructor(onedriveAccount: OnedriveAccount) {
        const odTree = OdTree(onedriveAccount.clientId, onedriveAccount.clientSecret, onedriveAccount.tenantId);
        odTree.then(tree => {
            this.root = fromOdTree(tree);
            this.ready = Promise.resolve();
        });
    }

    async cd(path: symbol[]) {
        await this.ready;
        const root = this.root!;
        return cd(path, root);
    }
    async back(path: symbol[]) {
        await this.ready;
        const root = this.root!;
        return back(path, root);
    }
    async mkdir(path: symbol[], name: string) {
        await this.ready;
        const root = this.root!;
        return mkdir(path, root, name);
    }
}

