export type headerMenuProps = {
  isOpen: boolean;
  toggle: () => void;
  hide: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
};

export type StatusStyle = {
  online: string;
  offline: string;
};

export type User = {
  id: string;
  avatar: string;
  username: string;
  status: keyof StatusStyle;
  interaction: Message[];
};

export type Message = {
  id: string;
  message: string;
  time: string;
  isSent: boolean;
};
