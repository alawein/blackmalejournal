import { fireEvent, render, screen } from '@testing-library/react';
import { AdminBulkActionForm } from '@/components/admin/AdminBulkActionForm';

describe('AdminBulkActionForm', () => {
  it('toggles all row checkboxes and updates the selected count', () => {
    render(
      <AdminBulkActionForm
        action={jest.fn(async () => {})}
        returnPath="/admin/articles"
        fieldName="bulk_status"
        fieldLabel="Bulk Status"
        fieldPlaceholder="Choose a status move"
        helper="Bulk helper copy."
        itemLabel="articles"
        submitLabel="Apply to Selected Articles"
        options={[
          { label: 'Move to Review', value: 'review' },
          { label: 'Publish Now', value: 'published' },
        ]}
      >
        <ul>
          <li>
            <input
              type="checkbox"
              name="selected_ids"
              value="art-1"
              data-bulk-item="true"
              aria-label="Select article one"
            />
          </li>
          <li>
            <input
              type="checkbox"
              name="selected_ids"
              value="art-2"
              data-bulk-item="true"
              aria-label="Select article two"
            />
          </li>
        </ul>
      </AdminBulkActionForm>,
    );

    expect(screen.getByText('0 articles selected on this page.')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Select Page'));

    expect(screen.getByLabelText('Select article one')).toBeChecked();
    expect(screen.getByLabelText('Select article two')).toBeChecked();
    expect(screen.getByText('2 articles selected on this page.')).toBeInTheDocument();
  });
});
