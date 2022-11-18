import { Message } from 'semantic-ui-react';
import { APIError } from '@amamentaufn/client-core';

APIError.prototype.renderErrorMessage = function (header) {
  if (this.message instanceof Array) {
    return (
      <Message negative>
        {header && <Message.Header>{header}</Message.Header>}
        <Message.List>
          {this.message.map((error, index) => {
            return <Message.Item key={index}>{error}</Message.Item>;
          })}
        </Message.List>
      </Message>
    );
  }

  return <Message content={this.message} header={header} negative />;
};
