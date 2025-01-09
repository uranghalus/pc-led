import SettingForm from '@/components/setting-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';

const SettingPage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Controller</CardTitle>
      </CardHeader>
      <CardContent>
        <SettingForm />
      </CardContent>
    </Card>
  );
};

export default SettingPage;
