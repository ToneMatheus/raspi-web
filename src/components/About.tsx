import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h1 className="mb-4">About Page</h1>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Welcome to the About Page</h5>
              <p className="card-text">
                This is a new page created using React Router and Bootstrap styling.
                You can customize this content as needed for your application.
              </p>
              <p className="card-text">
                This page demonstrates how to:
              </p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Create new page components</li>
                <li className="list-group-item">Set up routing with React Router</li>
                <li className="list-group-item">Use Bootstrap classes for styling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
