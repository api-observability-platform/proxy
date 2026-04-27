import { SetMetadata } from "@nestjs/common";
import { isPublicKeyConst } from "../consts/is-public-key.const";

export const PublicDecorator = () => SetMetadata(isPublicKeyConst, true);
