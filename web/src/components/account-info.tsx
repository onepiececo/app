import { User } from "lucide-react";

export type AccountInfoProps = {
  user?: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
};

const Avatar = (props: { user?: AccountInfoProps["user"] }) => {
  if (!props.user) {
    return (
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
        <User aria-hidden className="size-4" />
      </div>
    );
  }
  if (props.user.avatarUrl) {
    return (
      <div className="size-9 shrink-0 overflow-hidden rounded-full bg-muted">
        <img src={props.user.avatarUrl} alt={props.user.name} className="size-full object-cover" />
      </div>
    );
  }
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground/10 font-medium text-foreground text-sm">
      {props.user.name.slice(0, 1).toUpperCase()}
    </div>
  );
};

export const AccountInfo = (props: AccountInfoProps) => {
  const signedIn = !!props.user;
  return (
    <div className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-accent/40">
      <Avatar user={props.user} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-medium text-foreground text-sm">
          {signedIn ? props.user!.name : "Anonymous"}
        </span>
        <span className="truncate text-muted-foreground text-xs">
          {signedIn ? props.user!.email ?? "Signed in" : "Play resumes on this device"}
        </span>
      </div>
    </div>
  );
};
