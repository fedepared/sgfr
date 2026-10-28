import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.constant';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Result
        status="404"
        title="404"
        subTitle="La página que buscas no existe o ha sido movida."
        extra={
          <Button type="primary" onClick={() => navigate(ROUTES.HOME)}>
            Volver al Inicio
          </Button>
        }
      />
    </div>
  );
};
