import { SetMetadata } from "@nestjs/common";
import { IsPublicKey } from "../constants/is-public-key.constant";

export const Public = () => SetMetadata(IsPublicKey, true);
