export interface ICreateEvent {
    title: string;
    description: string;
    imageURL?: string;
    startTime: string;
    endTime: string;
    startDate: string;
    endDate: string;
    country: string;
    city: string;
    address: string;
    postalCode: string;
    fee: number;
    capacity: number;
    categoryId: string;
}
