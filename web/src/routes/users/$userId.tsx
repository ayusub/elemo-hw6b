import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

import { AuthenticatedLayout } from "@/components/layout/authenticated-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useBreadcrumbUtils } from "@/hooks/use-breadcrumbs";
import { requireAuthBeforeLoad } from "@/lib/auth/require-auth";
import { v1UserGet } from "@/lib/client/sdk.gen";
import { formatDate } from "@/lib/utils";

export const Route = createFileRoute("/users/$userId")({
  beforeLoad: requireAuthBeforeLoad,
  component: UserProfilePage,
});

function UserProfilePage() {
  const { userId } = Route.useParams();
  const { setBreadcrumbsFromItems } = useBreadcrumbUtils();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const res = await v1UserGet({
        // openapi-ts uses params.path for {id} in the URL
          path: { id: userId },
      });
      
      const anyRes = res as any;
      return anyRes.data ?? res;
    },
  });

  useEffect(() => {
    if (!data) return;
    setBreadcrumbsFromItems([
      { label: "Profile", isNavigatable: false },
      {
        label: `${data.first_name} ${data.last_name}`,
        isNavigatable: false,
      },
    ]);
  }, [data, setBreadcrumbsFromItems]);

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">Loading profile…</div>
      </AuthenticatedLayout>
    );
  }

  if (error || !data) {
    return (
      <AuthenticatedLayout>
        <div className="container mx-auto px-4 py-8">
          Failed to load user profile.
        </div>
      </AuthenticatedLayout>
    );
  }

  const user = data;

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-8 lg:flex lg:gap-6">
        {/* Left side: main profile content */}
        <div className="flex-1 space-y-4">
          <Card className="space-y-4 p-6">

        {/* Header: avatar + name + status */}
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="flex-shrink-0">
            <UserAvatar
            firstName={""}
            lastName={""}
            email={user.email}
            picture={user.picture || undefined}
            size="lg"
            />
        </div>

        <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">
                {user.first_name} {user.last_name}
            </h1>
            {user.status && (
                <Badge variant="outline" className="capitalize">
                {typeof user.status === "string" ? user.status : user.status.id}
                </Badge>
            )}
            </div>

            <p className="text-sm text-muted-foreground">@{user.username}</p>
            {user.title && <p className="text-sm">{user.title}</p>}
            {user.created_at && (
            <p className="text-sm text-muted-foreground">
                Member since {formatDate(user.created_at)}
            </p>
            )}
        </div>
        </div>

            <Separator className="my-4" />

            {/* About + contact + extra details */}
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-sm font-medium">About</h2>
                <p className="text-sm text-muted-foreground">
                  {user.bio || "No bio added yet."}
                </p>

                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Contact Information</h3>
                  <p className="text-sm">{user.email}</p>
                  {user.phone && (
                    <p className="text-sm text-muted-foreground">
                      {user.phone}
                    </p>
                  )}
                  {user.address && (
                    <p className="text-sm text-muted-foreground">
                      {user.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-medium">Additional Details</h2>

                {user.languages && user.languages.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Languages</p>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((lang: string) => (
                        <Badge key={lang} variant="outline">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {user.links && user.links.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Links</p>
                    <div className="flex flex-wrap gap-2">
                      {user.links.map((link: string) => (
                        <a
                          key={link}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium underline"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Placeholder: organization memberships / projects & issues */}
          <Card>
            <CardHeader>
              <CardTitle>Projects & Issues</CardTitle>
              <CardDescription>
                Placeholder section for this user&apos;s projects and issues.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This section will show the user&apos;s projects and issues once
                the backend APIs are available.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right side: activity card */}
        <div className="mt-6 w-full max-w-sm lg:mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Placeholder activity feed for this user.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="py-8 text-center text-sm text-muted-foreground">
                Activity feed will be implemented when the activity APIs are
                available.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
