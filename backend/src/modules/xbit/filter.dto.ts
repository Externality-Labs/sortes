export class TimeFilterDto {
  startTs: number;
  endTs?: number;
}

export enum QueryOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PlayerFilterDto {
  player: string;
  page?: number;
  order?: QueryOrder;
  orderBy?: string;
}
