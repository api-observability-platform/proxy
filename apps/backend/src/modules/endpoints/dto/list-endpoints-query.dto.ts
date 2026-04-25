import type { ListEndpointsQuery } from "@proxy-server/shared";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class ListEndpointsQueryDto
	extends PaginationQueryDto
	implements ListEndpointsQuery {}
