import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/entities/session'
import { profileQuery } from '@/entities/profile'
import { AccountSidebar } from '@/widgets/account-sidebar'
import { EditProfileForm } from '@/features/edit-profile'
import { AvatarUploader } from '@/features/update-avatar'
import { ChangePasswordForm } from '@/features/change-password'
import { Breadcrumb } from '@/shared/ui/Breadcrumb'
import { ErrorState } from '@/shared/ui/QueryState'
import { Separator } from '@/shared/ui/separator'
import { ProfilePageSkeleton } from './ProfilePageSkeleton'

const MOBILE_CARD_CLASSNAME =
  'rounded-[14px] bg-card p-4 shadow-[0px_20px_20px_rgba(10,6,4,0.45)] lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none'

export function ProfilePage() {
  const { user } = useSession()
  const profileResult = useQuery(profileQuery(user?.id))

  return (
    <main className="flex flex-col gap-7 px-4 md:px-0">
      <Breadcrumb items={[{ label: 'Início', to: '/' }, { label: 'Perfil' }]} />

      <div className="flex flex-col gap-7 lg:flex-row">
        <AccountSidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {profileResult.isPending ? (
            <ProfilePageSkeleton />
          ) : profileResult.isError ? (
            <ErrorState
              description="Não foi possível carregar seus dados de perfil."
              onRetry={() => profileResult.refetch()}
            />
          ) : (
            <>
              <div className={MOBILE_CARD_CLASSNAME}>
                <AvatarUploader user={profileResult.data ?? null} />
              </div>
              <Separator className="hidden lg:block" />
              <div className={MOBILE_CARD_CLASSNAME}>
                <EditProfileForm user={profileResult.data ?? null} />
              </div>
              <Separator className="hidden lg:block" />
              <div className={MOBILE_CARD_CLASSNAME}>
                <ChangePasswordForm />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
