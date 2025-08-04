<div className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    analise.status === 'Aprovado' 
                      ? 'bg-green-100 text-green-800'
                      : analise.status === 'Rejeitado'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {analise.status}
                  </span>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <a href={`/admin/analises/${analise.id}`}>
                  Ver detalhes
                </a>
              </Button>