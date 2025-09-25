import { IAsset } from "./IAsset";

export interface IWork {
    id?: string,
    slug?: string,
    image: IAsset,
    type: string[],
    name: string,
    statement: string,
    videos: IAsset[],
    images: IAsset[],
    canvas: IAsset[],
    assets: IAsset[],
    iphone: boolean,
    artworks: IAsset[],
}