import { useState } from 'react';

import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';

import Header from '../Header.jsx';
import { fetchEvent, deleteEvent, queryClient } from '../../util/http.js';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import Modal from '../UI/Modal.jsx';

export default function EventDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['events', params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  })

  const { mutate, isPending: isPendingDeletion, isError: isErrorDeleting, error: deletionError } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'], refetchType: 'none' });
      navigate('/events');
    }
  })

  function hnadleStartDelete() {
    setIsDeleting(true);
  }

  function handleStopDelete() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = <div id="event-details-content" className="center">
      <p>Fetching event data...</p>
    </div>;
  }

  if (isError) {
    content = <div id="event-details-content" className="center">
      <ErrorBlock
        title="An error occurred"
        message={error.info?.message || 'Failed to fetch event data'} />
    </div>;
  }

  if (data) {
    content = (
      <>
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={hnadleStartDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={data.date}>{data.date} @ {data.time}</time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {isDeleting && (
        <Modal onClose={handleStopDelete}>
          <h2>Are you sure?</h2>
          <p>Do you want to delete this event? This action cannot be undone.</p>
          <div className="form-actions">
            {isPendingDeletion && <p>Deleting...</p>}
            {(!isPendingDeletion && (
              <>
                <button onClick={handleStopDelete} className="button-text" >Cancel</button>
                <button onClick={handleDelete}className="button" >Delete</button>
                </>
            ))}
          </div>
          {isErrorDeleting && (
            <ErrorBlock
            title="Failed to delete event"
            message={deletionError.info?.message || 'Failed to delete event. Please try again later.'}
          />
          )}
        </Modal>
      )}
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">
        {content}
      </article>
    </>
  );
}
