import React from 'react';

const About: React.FC = () => {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-8 mx-auto">
          <h1 className="mb-4">About Me</h1>
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Hi, I'm Tone Matheus</h5>
              <p className="card-text">
                Welcome to my portfolio! This site was built to showcase my projects,
                skills, and experience as a developer. Here, you’ll find examples of my work
                and the technologies I use to bring ideas to life.
              </p>
              <p className="card-text">
                This portfolio demonstrates:
              </p>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">My personal projects and achievements</li>
                <li className="list-group-item">How I use React and modern web tools</li>
                <li className="list-group-item">A clean design with Bootstrap styling</li>
                <li className="list-group-item">How I use MySQL databases</li>
                <li className="list-group-item">How I use .NET for my backend services</li>
              </ul>
              <p className="mt-3">
                Thank you for visiting.
                I hope you enjoy exploring my work!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
