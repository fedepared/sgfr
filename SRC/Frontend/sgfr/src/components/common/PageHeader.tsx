import React from 'react';
import type { ReactNode } from 'react';
import { Typography, Row, Col, Space } from 'antd';

const { Title, Paragraph } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  extra?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, extra }) => {
  return (
    <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
      <Col>
        <Title level={3} style={{ margin: 0 }}>
          {title}
        </Title>
        {subtitle && (
          <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>
            {subtitle}
          </Paragraph>
        )}
      </Col>
      {extra && (
        <Col>
          <Space>{extra}</Space>
        </Col>
      )}
    </Row>
  );
};
