import { getTranslations } from "next-intl/server";
import { FormDialog } from "@/components/form-dialog";
import { getUserById, listUsers } from "@/queries/users";
import { UserForm } from "./_components/user-form";
import { UsersTable } from "./_components/users-table";

type UsersPageProps = {
    searchParams: Promise<{ id?: string }>;
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
    const { id } = await searchParams;
    const [users, editing] = await Promise.all([listUsers(), id ? getUserById(id) : null]);
    const t = await getTranslations("users");

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <UsersTable users={users} />

            <FormDialog
                open={Boolean(editing)}
                onCloseHref="/users"
                title={t("edit")}
                className="sm:max-w-xl"
            >
                {editing && (
                    <UserForm
                        user={{
                            id: editing.id,
                            name: editing.name,
                            email: editing.email,
                            role: editing.role,
                        }}
                    />
                )}
            </FormDialog>
        </div>
    );
}
