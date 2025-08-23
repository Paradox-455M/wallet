const EventEmitter = require('events');

class TransactionEventBus extends EventEmitter {}

const eventBus = new TransactionEventBus();

const getEventName = (transactionId) => `transaction:${transactionId}`;

function emitTransactionUpdate(transactionId, event) {
  eventBus.emit(getEventName(transactionId), {
    ...event,
    transactionId,
    timestamp: new Date().toISOString()
  });
}

function subscribeToTransaction(transactionId, listener) {
  const eventName = getEventName(transactionId);
  eventBus.on(eventName, listener);
  return () => eventBus.off(eventName, listener);
}

module.exports = {
  emitTransactionUpdate,
  subscribeToTransaction
};