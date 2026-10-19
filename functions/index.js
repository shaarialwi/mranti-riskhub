/** Optional server-recorded audit log (requires deployed Firebase Functions + Blaze billing). */
const {onDocumentWrittenWithAuthContext} = require('firebase-functions/v2/firestore');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore,FieldValue} = require('firebase-admin/firestore');
initializeApp();
exports.logRiskChange = onDocumentWrittenWithAuthContext(
  {document:'risks/{riskId}', region:'asia-southeast1'},
  async event => {
    const before=event.data?.before?.data()||null;
    const after=event.data?.after?.data()||null;
    const changedKeys=new Set([...Object.keys(before||{}),...Object.keys(after||{})]);
    const changed=[...changedKeys].filter(k=>JSON.stringify(before?.[k])!==JSON.stringify(after?.[k]));
    const doc={
      riskId:event.params.riskId,
      eventId:event.id,
      actorUid:event.authId||null,
      authType:event.authType||null,
      operation:!before?'created':!after?'deleted':'updated',
      oldStatus:before?.status||null,
      newStatus:after?.status||null,
      changedFields:changed,
      recordedAt:FieldValue.serverTimestamp(),
    };
    // Event ID makes Cloud Events re-delivery idempotent.
    await getFirestore().collection('audit_events').doc(event.id.replaceAll('/','_')).set(doc,{merge:false});
  }
);
