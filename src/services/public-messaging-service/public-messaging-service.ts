/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
import PublicMessaging from "@/contract/PublicMessaging.json";
import { createTransaction } from "../web3-service/web3-service";
import { AbiItem } from "web3-utils";
import { contractMessagesToMessageModelMap } from "@/map/contract-messages-to-message-model-map";
import {
  ContractUser,
  MessageModel,
  contractMessageListModel,
} from "@/contract";
import Web3 from "web3";
import { ContractAddressEnum } from "@/config";
const contractAddress = ContractAddressEnum.publicMessagingETHTest as string;

export async function getMessages(
  wallet: string,
  provider: Web3
): Promise<MessageModel[]> {
  const abi = PublicMessaging.abi as Array<AbiItem>;
  const contract = new provider.eth.Contract(abi, contractAddress);
  return new Promise<MessageModel[]>((resolve, reject) => {
    contract.methods
      .getAllMessages()
      .call()
      .then((result: contractMessageListModel[]) => {
        const msgMapped = contractMessagesToMessageModelMap(wallet, result);
        resolve(msgMapped);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
}
export async function getActiveMessages(provider: Web3): Promise<number> {
  const abi = PublicMessaging.abi as Array<AbiItem>;
  const contract = new provider.eth.Contract(abi, contractAddress);
  return new Promise<number>((resolve, reject) => {
    contract.methods
      .getTotalActiveMessages()
      .call()
      .then((result: number) => {
        console.log(result);
        resolve(result);
      })
      .catch((err: Error) => {
        reject(err);
      });
  });
}
export async function getUser(
  wallet: string,
  provider: Web3
): Promise<ContractUser | undefined> {
  const abi = PublicMessaging.abi as Array<AbiItem>;
  const contract = new provider.eth.Contract(abi, contractAddress);
  return new Promise<ContractUser | undefined>((resolve) => {
    contract.methods
      .getUser(wallet)
      .call()
      .then((result: ContractUser) => {
        resolve(result);
      })
      .catch((err: Error) => {
        console.error("get user error", err);
        resolve(undefined);
      });
  });
}

export async function createUser(
  name: string,
  provider: Web3,
  from: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  onConfirmCallback: Function
): Promise<boolean> {
  const contractABI = PublicMessaging.abi as AbiItem[];
  const contract = new provider.eth.Contract(contractABI, contractAddress);
  const fee = provider.utils.toWei("0.01", "ether");
  const transactionObject = {
    from: from,
    to: contractAddress,
    value: fee,
    data: contract.methods.createUser(name).encodeABI(),
  };
  return createTransaction(provider, transactionObject, onConfirmCallback);
}
export async function writeMessage(
  content: string,
  provider: Web3,
  from: string,
  onConfirmCallback: Function
): Promise<boolean> {
  const contractABI = PublicMessaging.abi as AbiItem[];
  const contract = new provider.eth.Contract(contractABI, contractAddress);
  const transactionObject = {
    from: from,
    to: contractAddress,
    data: contract.methods.writeMessage(content).encodeABI(),
  };
  return createTransaction(provider, transactionObject, onConfirmCallback);
}
export async function deleteMessage(
  id: number,
  provider: Web3,
  from: string,
  onConfirmCallback: Function
): Promise<boolean> {
  const contractABI = PublicMessaging.abi as AbiItem[];
  const contract = new provider.eth.Contract(contractABI, contractAddress);
  const transactionObject = {
    from: from,
    to: contractAddress,
    data: contract.methods.deleteMessage(id).encodeABI(),
  };
  return createTransaction(provider, transactionObject, onConfirmCallback);
}
export function attachContractEvent(
  provider: Web3,
  onMessageSend: Function,
  onMessageDelete: Function
): void {
  const contractABI = PublicMessaging.abi as AbiItem[];
  const contract = new provider.eth.Contract(contractABI, contractAddress);
  contract.events.MessageSent((error: Error, _event: any) => {
    if (error) {
      return;
    }
    onMessageSend();
  });
  contract.events.MessageDeleted((error: Error, _event: any) => {
    if (error) {
      return;
    }
    onMessageDelete();
  });
}
