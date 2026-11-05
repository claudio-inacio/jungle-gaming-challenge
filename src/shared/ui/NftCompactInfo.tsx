import { Text } from '@/shared/ui/Text'

type Props = {
  tokenId: string
  collectionName: string
  attributeValues: string
}

export function NftCompactInfo({ tokenId, collectionName, attributeValues }: Props) {
  return (
    <dl className="flex flex-col gap-1">
      <div className="flex gap-2">
        <dt>
          <Text variant="body" className="text-brand-secondary">
            ID do token:
          </Text>
        </dt>
        <dd>
          <Text variant="body" className="text-brand-secondary">
            {tokenId}
          </Text>
        </dd>
      </div>
      <div className="flex gap-2">
        <dt>
          <Text variant="body" className="text-brand-secondary">
            Coleção:
          </Text>
        </dt>
        <dd>
          <Text variant="body" className="text-brand-secondary">
            {collectionName}
          </Text>
        </dd>
      </div>
      {attributeValues.length > 0 && (
        <div className="flex gap-2">
          <dt>
            <Text variant="body" className="text-brand-secondary">
              Atributos:
            </Text>
          </dt>
          <dd>
            <Text variant="body" className="text-brand-secondary">
              {attributeValues}
            </Text>
          </dd>
        </div>
      )}
    </dl>
  )
}
