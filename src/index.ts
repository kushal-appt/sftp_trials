import Client from 'ssh2-sftp-client';
import { SFTPClientOptions } from './types.js';
import fs from "fs/promises";
import path from "path";


async function isExists(path: string) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

class SFTPClient {
  private client: Client;

  constructor() {
    this.client = new Client();
  }

  async connect(options: SFTPClientOptions) {
    console.log(`Connecting to ${options.host}:${options.port}`);
    try {
      await this.client.connect(options);
    } catch (err) {
      console.log('Failed to connect:', err);
    }
  }

  async disconnect() {
    await this.client.end();
  }

  async listFiles(remoteDir: string) {
    console.log(`Listing ${remoteDir} ...`);
    let fileObjects: Client.FileInfo[] | undefined;

    try {
      fileObjects = await this.client.list(remoteDir);
    } catch (err) {
      console.log('Listing failed:', err);
    }
    if (!fileObjects) {
      throw new Error(`File objects are empty`);
    }

    const fileNames = [];

    for (const file of fileObjects) {
      if (file.type === 'd') {
        console.log(
          `${new Date(file.modifyTime).toISOString()} PRE ${file.name}`
        );
      } else {
        console.log(
          `${new Date(file.modifyTime).toISOString()} ${file.size} ${file.name}`
        );
      }

      fileNames.push(file.name);
    }

    return fileNames;
  }

  async uploadFile(localFile: string, remoteFile: string) {
    const dirname = path.dirname(localFile);
    const exist = await isExists(dirname);
    if(!exist) {
      throw new Error(`The following local file ${localFile} doesn't exists!`)
    }
    console.log(`Uploading ${localFile} to ${remoteFile} ...`);
    try {
      await this.client.put(dirname, remoteFile);
    } catch (err) {
      console.error('Uploading failed:', err);
    }
  }
}

(async () => {
  const client = new SFTPClient();
  await client.connect({
    host: 'localhost',
    port: 2222,
    username: 'foo',
    password: 'pass',
  });

  //await client.listFiles('.');
  await client.uploadFile('./local.txt', '/upload/remote.txt');
  await client.disconnect();
})();
