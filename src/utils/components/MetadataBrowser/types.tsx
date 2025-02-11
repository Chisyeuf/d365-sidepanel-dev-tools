import { ProcessProps } from "../../global/.processClass";
import { ObjectListGridProps } from "./ObjectListGrid";

export interface ExploreGrid {
    entityName: string;
    explortFileName: string;
    openFrom: ObjectListGridProps['openFrom'];
}