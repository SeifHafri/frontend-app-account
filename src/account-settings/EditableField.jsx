/* eslint-disable no-unused-vars */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button, Form, StatefulButton,
} from '@edx/paragon';
// eslint-disable-next-line no-unused-vars
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import SwitchContent from './SwitchContent';
import messages from './AccountSettingsPage.messages';

import {
  openForm,
  closeForm,
} from './data/actions';
import { editableFieldSelector } from './data/selectors';
import CertificatePreference from './certificate-preference/CertificatePreference';

const EditableField = (props) => {
  const {
    name,
    label,
    emptyLabel,
    type,
    value,
    userSuppliedValue,
    saveState,
    error,
    confirmationMessageDefinition,
    confirmationValue,
    helpText,
    onEdit,
    onCancel,
    onSubmit,
    onChange,
    isEditing,
    isEditable,
    isGrayedOut,
    intl,
    ...others
  } = props;
  const id = `field-${name}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(name, new FormData(e.target).get(name));
  };

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const handleEdit = () => {
    onEdit(name);
  };

  const handleCancel = () => {
    onCancel(name);
  };

  const renderEmptyLabel = () => {
    if (isEditable) {
      return <Button variant="link" onClick={handleEdit} className="p-0">{emptyLabel}</Button>;
    }
    return <span className="text-muted">{emptyLabel}</span>;
  };

  const renderValue = (rawValue) => {
    if (!rawValue) {
      return renderEmptyLabel();
    }
    let finalValue = rawValue;

    if (userSuppliedValue) {
      finalValue += `: ${userSuppliedValue}`;
    }

    return finalValue;
  };

  const renderConfirmationMessage = () => {
    if (!confirmationMessageDefinition || !confirmationValue) {
      return null;
    }
    return intl.formatMessage(confirmationMessageDefinition, {
      value: confirmationValue,
    });
  };

  return (
    <SwitchContent
      expression={isEditing ? 'editing' : 'default'}
      cases={{
        editing: (
          <div>
            <form onSubmit={handleSubmit}>
              <Form.Group
                controlId={id}
                isInvalid={error != null}
              >
                <Form.Label size="sm" className="h6 d-block" htmlFor={id}>{label}</Form.Label>
                <Form.Control
                  data-hj-suppress
                  name={name}
                  id={id}
                  type={type}
                  value={value}
                  onChange={handleChange}
                  {...others}
                />
                {!!helpText && <Form.Text>{helpText}</Form.Text>}
                {error != null && <Form.Control.Feedback hasIcon={false}>{error}</Form.Control.Feedback>}
                {others.children}
              </Form.Group>
              <p>
                <StatefulButton
                  type="submit"
                  className="mr-2"
                  state={saveState}
                  labels={{
                    default: intl.formatMessage(messages['account.settings.editable.field.action.save']),
                  }}
                  onClick={(e) => {
                    // Swallow clicks if the state is pending.
                    // We do this instead of disabling the button to prevent
                    // it from losing focus (disabled elements cannot have focus).
                    // Disabling it would causes upstream issues in focus management.
                    // Swallowing the onSubmit event on the form would be better, but
                    // we would have to add that logic for every field given our
                    // current structure of the application.
                    if (saveState === 'pending') { e.preventDefault(); }
                  }}
                  disabledStates={[]}
                />
                <Button
                  variant="outline-primary"
                  onClick={handleCancel}
                >
                  {intl.formatMessage(messages['account.settings.editable.field.action.cancel'])}
                </Button>
              </p>
            </form>
            {['name', 'verified_name'].includes(name) && <CertificatePreference fieldName={name} />}
          </div>
        ),
        default: (
          <div className="form-group">
            <div className="d-flex align-items-start">
              <h6 aria-level="3">{label}</h6>
              {isEditable ? (
                <Button variant="link" onClick={handleEdit} className="ml-3">
                  {/* <FontAwesomeIcon className="mr-1" icon={faPencilAlt} /> */}
                  {intl.formatMessage(messages['account.settings.editable.field.action.edit'])}
                </Button>
              ) : null}
            </div>
            <p data-hj-suppress className={isGrayedOut ? 'grayed-out' : 'editable-field'}>{renderValue(value)}</p>
            <p className="small text-muted mt-n2">{renderConfirmationMessage() || helpText}</p>
          </div>
        ),
      }}
    />
  );
};

EditableField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node]),
  emptyLabel: PropTypes.node,
  type: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userSuppliedValue: PropTypes.string,
  saveState: PropTypes.oneOf(['default', 'pending', 'complete', 'error']),
  error: PropTypes.string,
  confirmationMessageDefinition: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  confirmationValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  helpText: PropTypes.node,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  isEditable: PropTypes.bool,
  isGrayedOut: PropTypes.bool,
  intl: intlShape.isRequired,
};

EditableField.defaultProps = {
  value: undefined,
  saveState: undefined,
  label: undefined,
  emptyLabel: undefined,
  error: undefined,
  confirmationMessageDefinition: undefined,
  confirmationValue: undefined,
  helpText: undefined,
  isEditing: false,
  isEditable: true,
  isGrayedOut: false,
  userSuppliedValue: undefined,
};

export default connect(editableFieldSelector, {
  onEdit: openForm,
  onCancel: closeForm,
})(injectIntl(EditableField));
