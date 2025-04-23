function ProjectItem(props) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col p-5 transition-all rounded border border-surface-300 hover:border-transparent hover:scale-110 brightness-75 hover:brightness-100 hover:z-10 hover:bg-primary-300 hover:bg-opacity-30 hover:backdrop-blur-md"
    >
      <div className="text-surface-600 mb-4 flex flex-row items-center justify-between">
        <div className="text-xs font-medium tracking-widest uppercase">
          {props.lib}
        </div>
      </div>
      <h1 className="mb-4 text-xl subpixel-antialiased break-words hyphens-auto overflow-wrap-anywhere">{props.name}</h1>
      <div className="text-surface-600 text-xs">{props.description}</div>
      <div className="text-surface-600 text-xs mt-2">
        {props.keywords && props.keywords.length > 0 ? (
          props.keywords.map((keyword, index) => (
            <span
              key={index}
              className="inline-block bg-surface-200 text-surface-600 rounded-full px-2 py-1 text-xs font-semibold mr-2 mb-2"
            >
              {keyword}
            </span>
          ))
        ) : null}
      </div>
    </a>
  );
}

export default ProjectItem;
