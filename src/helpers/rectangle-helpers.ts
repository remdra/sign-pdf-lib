import { Rectangle, Size } from '../models';
import { emptyRectangle } from '../models/rectangle';

function computeCoordinate(coordinate: number, limit: number): number {
    return coordinate >= 0
        ? coordinate
        : (limit + coordinate);
}

export function computeAbsolutePageReverseRectangle(relativeRectangle: Rectangle | undefined, pageSize: Size): Rectangle {
    if(!relativeRectangle) {
        return emptyRectangle;
    }

    return {
        left: computeCoordinate(relativeRectangle.left, pageSize.width),
        top: pageSize.height - computeCoordinate(relativeRectangle.top, pageSize.height),
        right: computeCoordinate(relativeRectangle.right, pageSize.width),
        bottom: pageSize.height - computeCoordinate(relativeRectangle.bottom, pageSize.height)
    };
}

export function computeAbsolutePageRectangle(relativeRectangle: Rectangle | undefined, pageSize: Size): Rectangle {
    if(!relativeRectangle) {
        return emptyRectangle;
    }

    return {
        left: computeCoordinate(relativeRectangle.left, pageSize.width),
        top: computeCoordinate(relativeRectangle.top, pageSize.height),
        right: computeCoordinate(relativeRectangle.right, pageSize.width),
        bottom: computeCoordinate(relativeRectangle.bottom, pageSize.height)
    };
}
