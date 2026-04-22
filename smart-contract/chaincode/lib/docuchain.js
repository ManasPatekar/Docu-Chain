/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class DocuChainContract extends Contract {

    async StoreDocumentHash(ctx, documentId, fileHash, timestamp) {
        const doc = {
            docId: documentId,
            hash: fileHash,
            timestamp: timestamp,
            owner: ctx.clientIdentity.getID()
        };
        await ctx.stub.putState(documentId, Buffer.from(JSON.stringify(doc)));
        return JSON.stringify(doc);
    }

    async VerifyDocumentHash(ctx, documentId) {
        const docAsBytes = await ctx.stub.getState(documentId);
        if (!docAsBytes || docAsBytes.length === 0) {
            throw new Error(`The document ${documentId} does not exist`);
        }
        return docAsBytes.toString();
    }

    async GetHistory(ctx, documentId) {
        const iterator = await ctx.stub.getHistoryForKey(documentId);
        const allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                jsonRes.txId = res.value.txId;
                jsonRes.timestamp = res.value.timestamp;
                try {
                    jsonRes.value = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    jsonRes.value = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        await iterator.close();
        return JSON.stringify(allResults);
    }
}

module.exports = DocuChainContract;
