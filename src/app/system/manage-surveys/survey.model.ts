export class Survey {
    id: number;
    key: string;
    name: string;
    countryCode: string;
    description: string;
    questionDatas: Array<QuestionData>;
}

export class QuestionData {
    id: number;
    key: string;
    sequenceNo: number;
    text: string;
    description: string;
    responseDatas: Array<ResponseData>;
}

export class ResponseData {
    id: number;
    sequenceNo: number;
    text: string;
    value: number;
}
