import { Rectangle, Size } from '../models';
import { computeAbsolutePageRectangle, computeAbsolutePageReverseRectangle } from './rectangle-helpers';

import { expect } from 'chai';

describe('computeAbsolutePageReverseRectangle', function () {

    const referenceSize: Size = {
        width: 100,
        height: 200
    };

    it('computes absolute rectangle for absolute rectangle', function() {
        const relativeRectangle: Rectangle = {
            left: 10,
            right: 20,
            top: 15,
            bottom: 25
        };

        const computedRectangle = computeAbsolutePageReverseRectangle(relativeRectangle, referenceSize);

        expect(computedRectangle).to.be.deep.equal({ left: 10, right: 20, top: 185, bottom: 175 });
    })

    it('computes absolute rectangle for relative rectangle', function() {
        const relativeRectangle: Rectangle = {
            left: -90,
            right: -80,
            top: -185,
            bottom: -175
        };

        const computedRectangle = computeAbsolutePageReverseRectangle(relativeRectangle, referenceSize);

        expect(computedRectangle).to.be.deep.equal({ left: 10, right: 20, top: 185, bottom: 175 });
    })
})

describe('computeAbsolutePageRectangle', function () {

    const referenceSize: Size = {
        width: 100,
        height: 200
    };

    it('computes absolute rectangle for absolute rectangle', function() {
        const relativeRectangle: Rectangle = {
            left: 10,
            right: 20,
            top: 15,
            bottom: 25
        };

        const computedRectangle = computeAbsolutePageRectangle(relativeRectangle, referenceSize);

        expect(computedRectangle).to.be.deep.equal({ left: 10, right: 20, top: 15, bottom: 25 });
    })

    it('computes absolute rectangle for relative rectangle', function() {
        const relativeRectangle: Rectangle = {
            left: -90,
            right: -80,
            top: -185,
            bottom: -175
        };

        const computedRectangle = computeAbsolutePageRectangle(relativeRectangle, referenceSize);

        expect(computedRectangle).to.be.deep.equal({ left: 10, right: 20, top: 15, bottom: 25 });
    })
})
