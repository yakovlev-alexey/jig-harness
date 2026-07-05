import { CreateUserFormUi } from './create-user-form';

type CreateUserFormWidgetProps = {
  className?: string;
};

export function CreateUserFormWidget({ className }: CreateUserFormWidgetProps) {
  return <CreateUserFormUi className={className} />;
}
