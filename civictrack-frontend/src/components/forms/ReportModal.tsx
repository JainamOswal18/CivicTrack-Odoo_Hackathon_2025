import React from 'react';
import { useForm } from 'react-hook-form';
import API from '../../services/api';
import { Button } from '../common/Button';
import styles from './ReportModal.module.css';

interface Props {
  location: { lat: number; lng: number };
  onClose(): void;
  onSuccess(): void;
}

type FormData = {
  title: string;
  description: string;
  category: string;
  is_anonymous: boolean;
  images: FileList;
};

const ReportModal: React.FC<Props> = ({ location, onClose, onSuccess }) => {
  const { register, handleSubmit } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    const form = new FormData();
    form.append('title', data.title);
    form.append('description', data.description);
    form.append('category', data.category);
    form.append('latitude', location.lat.toString());
    form.append('longitude', location.lng.toString());
    form.append('is_anonymous', String(data.is_anonymous));
    Array.from(data.images).forEach(f => form.append('images', f));

    await API.post('/issues', form);
    onSuccess();
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <h3 className={styles.header}>Report New Issue</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formGroup}>
            <label>Title</label><br/>
            <input {...register('title',{ required:true })} />
          </div>
          <div className={styles.formGroup}>
            <label>Description</label><br/>
            <textarea rows={3} {...register('description',{ required:true })}/>
          </div>
          <div className={styles.formGroup}>
            <label>Category</label><br/>
            <select {...register('category',{ required:true })}>
              <option value="">Select</option>
              <option value="roads">Roads</option>
              <option value="lighting">Lighting</option>
              <option value="water">Water</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="safety">Safety</option>
              <option value="obstructions">Obstructions</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>Photos</label><br/>
            <input type="file" multiple accept="image/*" {...register('images')}/>
          </div>
          <div className={styles.formGroup}>
            <label>
              <input type="checkbox" {...register('is_anonymous')} /> Report anonymously
            </label>
          </div>
          <div className={styles.actions}>
            <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
