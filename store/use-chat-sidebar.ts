import { create } from "zustand";

export enum ChatVariant {
  CHAT = "CHAT",
  COMMUNITY = "COMMUNITY",
  GIFT = "GIFT",
}

export enum GiftMode {
  TIP = "TIP",
  GIFT = "GIFT",
}

interface ChatSidebarStore {
  collapsed: boolean;
  variant: ChatVariant;
  giftMode: GiftMode;
  isShowTipModal: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onChangeVariant: (variant: ChatVariant) => void;
  onChangeGiftMode: (giftMode: GiftMode) => void;
  onChangeShowTipModal: (isShowTipModal: boolean) => void;
}

export const useChatSidebar = create<ChatSidebarStore>((set) => ({
  collapsed: false,
  variant: ChatVariant.CHAT,
  giftMode: GiftMode.TIP,
  isShowTipModal: false,
  onExpand: () => set(() => ({ collapsed: false })),
  onCollapse: () => set(() => ({ collapsed: true })),
  onChangeVariant: (variant: ChatVariant) => set(() => ({ variant })),
  onChangeGiftMode: (giftMode: GiftMode) => set(() => ({ giftMode })),
  onChangeShowTipModal: (isShowTipModal: boolean) => set(() => ({ isShowTipModal })),
}));
