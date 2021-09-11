import { useState } from 'react';
import { withAuthenticator } from 'aws-amplify-react';

function App() {
  const [notes, setNotes] = useState([
    {
      id: 1,
      note: 'Hello world',
    },
  ]);

  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-l">Amplify Notetaker</h1>

      {/* Note form */}
      <form className="mb3">
        <input type="text" placeholder="Write your note" className="pa2 f4" />
        <button type="submit" className="pa2 f4">
          Add note
        </button>
      </form>

      {/* Notes list */}
      <div>
        {notes.map((item) => (
          <div key={item.id} className="flex items-center">
            <li className="list pa1 f3">{item.note}</li>
            <button className="bg-transparent bn f4">
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
