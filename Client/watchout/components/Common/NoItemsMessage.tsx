import { Text } from 'components/Base/Text'
import React from 'react'
import { View } from 'react-native'
import { Icon } from 'react-native-paper'

type NoItemsMessageProps = {
  entityName: string
  iconName?: string
}

export const NoItemsMessage = ({ entityName, iconName }: NoItemsMessageProps) => {
  return (
    <View style={{ alignItems: 'center', marginTop: 32 }}>
      <Icon source={iconName || 'comment'} size={64} color="#bbb" />
      <Text>Nie znaleziono {entityName}</Text>
    </View>
  )
}
