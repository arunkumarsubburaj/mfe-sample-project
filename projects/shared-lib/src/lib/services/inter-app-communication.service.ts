import { Injectable, computed, Signal } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export type Participant =
  | 'Shell'
  | 'Header'
  | 'Products'
  | 'Cart';

export interface MessageData<T = any> {
  from: Participant;
  to: Participant;
  type: string;
  content: T;
}

type CommunicationState = {
  message: MessageData | null;
};

/**
 * Signal store to manage inter-app communication messages.
 * It holds the current message and provides methods to send and clear messages.
 */
const CommunicationStore = signalStore(
  withState<CommunicationState>({ message: null }),
  withMethods(store => ({
    sendMessage: (message: MessageData, forceUpdate: boolean = false) => {
      if (forceUpdate) {
        // First clear the message to ensure signal change detection
        patchState(store, { message: null });
        // Use setTimeout to ensure the clear operation completes before setting new message
        setTimeout(() => {
          patchState(store, { message });
        }, 0);
      } else {
        patchState(store, { message });
      }
    },
    clearMessage: () => {
      patchState(store, { message: null });
    },
  }))
);

@Injectable({ providedIn: 'root' })
export class InterAppCommunicationService {
  private communicationStore = new CommunicationStore();

  /**
   * Signal that holds the current message.
   * This signal will update whenever a new message is sent or cleared.
   */
  message = this.communicationStore.message;
  
  /**
   * Sends a message to the communication store.
   * @param message The message data to send.
   * @param forceUpdate Optional parameter to force signal update even when sending the same data.
   *                   When true, the message will be cleared first and then set with a timestamp.
   */
  sendMessage(message: MessageData, forceUpdate: boolean = false): void {
    this.communicationStore.sendMessage(message, forceUpdate);
  }

  /**
   * Clears the current message in the communication store.
   */
  clearMessage(): void {
    this.communicationStore.clearMessage();
  }

  /**
   * Retrieves a message from the communication store based on the participant(from) and type.
   * @param from The participant from whom the message is received.
   * @param type The type of the message to retrieve - What data is expected in the message.
   * @returns A signal that emits the message data or null if no matching message is found.
   */
  getMessage(from: Participant, type: string): Signal<MessageData | null> {
    return computed(() => {
      const currentMessage = this.message();
      if (
        currentMessage &&
        currentMessage.from === from &&
        currentMessage.type === type
      ) {
        return currentMessage;
      }
      return null;
    });
  }
}
