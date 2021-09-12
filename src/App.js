import { useState, useEffect } from 'react';
import { withAuthenticator } from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import { createNote, deleteNote, updateNote } from './graphql/mutations';
import { listNotes } from './graphql/queries';

function App() {
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState('');
  const [id, setId] = useState('');

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
    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = result.data.updateNote;
    // const index = notes.findIndex((note) => note.id === updatedNote.id);

    // setNotes((prevState) => [
    //   ...prevState.slice(0, index),
    //   updatedNote,
    //   ...prevState.slice(index + 1),
    // ]);

    setNotes((prevState) =>
      prevState.map((note) => (note.id === id ? updatedNote : note))
    );
  };

  const handleAddNote = async (e) => {
    e.preventDefault();

    const input = {
      note: noteInput,
    };

    // check if we have an existing note, if so, update it
    if (hasExistingNote()) {
      handleUpdateNote();
    } else {
      const result = await API.graphql(graphqlOperation(createNote, { input })); // execute mutation
      const newNote = result.data.createNote;
      setNotes((prevState) => [newNote, ...prevState]);
      setNoteInput('');
    }
  };

  const handleDeleteNote = async (noteId) => {
    const input = { id: noteId };

    const result = await API.graphql(graphqlOperation(deleteNote, { input }));
    const deletedNoteId = result.data.deleteNote.id;

    setNotes((prevState) =>
      prevState.filter((note) => note.id !== deletedNoteId)
    );
  };

  const handleSetNote = ({ note, id }) => {
    setNoteInput(note);
    setId(id);
  };

  useEffect(() => {
    const fetchNotes = async () => {
      const result = await API.graphql(graphqlOperation(listNotes));
      setNotes(result.data.listNotes.items);
    };
    fetchNotes();
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
