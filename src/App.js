import { useState, useEffect } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';
import {
  onCreateNote,
  onDeleteNote,
  onUpdateNote,
} from './graphql/subscriptions';

function App() {
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [id, setId] = useState('');

  const fetchNotes = async () => {
    const result = await API.graphql(graphqlOperation(listNotes));
    setNotes(result.data.listNotes.items);
  };

  const handleChangeNote = (e) => {
    setNoteInput(e.target.value);
  };

  const hasExistingNote = () => {
    if (id) {
      // is the id a valid id.
      const isNote = notes.findIndex((note) => note.id === id) > -1; // use > - 1 to convert it to a boolean, if it's a positive value it's found
      return isNote;
    }
    return false;
  };

  const handleUpdateNote = async () => {
    const input = {
      id,
      note: noteInput,
    };
    await API.graphql(graphqlOperation(updateNote, { input }));
  };

  const handleAddNote = async (e) => {
    e.preventDefault();

    // check if we have an existing note, if so, update it
    if (hasExistingNote()) {
      handleUpdateNote();
    } else {
      const input = {
        note: noteInput,
      };

      await API.graphql(graphqlOperation(createNote, { input })); // execute mutation

      setNoteInput('');
    }
  };

  const handleDeleteNote = async (noteId) => {
    const input = { id: noteId };

    await API.graphql(graphqlOperation(deleteNote, { input }));
  };

  const handleSetNote = ({ note, id }) => {
    setNoteInput(note);
    setId(id);
  };

  useEffect(() => {
    fetchNotes();

    const createNoteListener = API.graphql(
      graphqlOperation(onCreateNote)
    ).subscribe({
      //  this runs everytime a note has been created, even though there isn't a dependency array for it.
      next: (noteData) => {
        const newNote = noteData.value.data.onCreateNote;
        setNotes((prevState) => {
          let prevNotes = prevState.filter((note) => note.id !== newNote.id);
          return [...prevNotes, newNote];
        });
      },
    });

    const deleteNoteListener = API.graphql(
      graphqlOperation(onDeleteNote)
    ).subscribe({
      next: (noteData) => {
        const deletedNote = noteData.value.data.onDeleteNote;

        setNotes((prevState) =>
          prevState.filter((note) => note.id !== deletedNote.id)
        );
      },
    });

    const updateNoteListener = API.graphql(
      graphqlOperation(onUpdateNote)
    ).subscribe({
      next: (noteData) => {
        const updatedNote = noteData.value.data.onUpdateNote;

        setNotes((prevState) =>
          prevState.map((note) =>
            note.id === updatedNote.id ? updatedNote : note
          )
        );
      },
    });

    return () => {
      // remove the listener on unmount
      createNoteListener.unsubscribe();
      deleteNoteListener.unsubscribe();
      updateNoteListener.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-l">Amplify Notetaker</h1>

      {/* Note form */}
      <form className="mb3" onSubmit={handleAddNote}>
        <input
          type="text"
          placeholder="Write your note"
          className="pa2 f4"
          value={noteInput}
          onChange={handleChangeNote}
        />
        <button type="submit" className="pa2 f4">
          {id ? 'Update Note' : 'Add Note'}
        </button>
      </form>

      {/* Notes list */}
      <div>
        {notes.map((item) => (
          <div key={item.id} className="flex items-center">
            <li onClick={() => handleSetNote(item)} className="list pa1 f3">
              {item.note}
            </li>
            <button
              onClick={() => handleDeleteNote(item.id)}
              className="bg-transparent bn f4">
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
