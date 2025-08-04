<p className="font-medium">{imobiliaria.nome_empresa || 'Nome não informado'}</p>
                  <p className="text-sm">{imobiliaria.email}</p>
                  <p className="text-sm">{imobiliaria.telefone || 'Telefone não informado'}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                  >
                    <a href={`/admin/imobiliarias/${imobiliaria.id}`}>
                      Ver perfil da imobiliária
                    </a>
                  </Button>