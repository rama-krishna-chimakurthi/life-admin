// src/components/PullToRefresh.tsx
import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function PullToRefresh({ children, onRefresh, refreshing }: PullToRefreshProps) {
  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#3778C2"
          colors={['#3778C2']}
        />
      }
    >
      {children}
    </ScrollView>
  );
}