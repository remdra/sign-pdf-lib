import { Rectangle, Size } from '../models';
import { computeAbsolutePageRectangle } from './rectangle-helpers';

import { expect } from 'chai';

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

        expect(computedRectangle).to.be.deep.equal({ left: 10, right: 20, top: 185, bottom: 175 });
    })

    it('computes absolute rectangle for relative rectangle', function() {
        const relativeRectangle: Rectangle = {
            left: -90,
            right: -80,
            top: -185,
            bottom: -175
        };

        const computedRectangle = computeAbsolutePageRectangle(relativeRectangle, referenceSize);

        expect(computedRectangle).to.be.deep.equal({ left: 10, right: 20, top: 185, bottom: 175 });
    })
})
